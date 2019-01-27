import json
import os
import re
import subprocess


def parse_sectioned_file(fn):
    sections = {}
    current_section = None

    with open(fn, 'rt') as f:
        for line in f.readlines():
            line = line.strip()
            if not line:
                continue
            if line.startswith('#'):
                current_section = []
                sections[re.sub(
                    r'\(.*\)', '', line,
                ).strip('# ')] = current_section
            else:
                current_section.append(parse_bracketed_line(line))

    return sections


def parse_bracketed_line(line):
    options = []
    for bracketed, unbracketed in (
        (m.group('bracketed'), m.group('unbracketed')) for m in
        re.finditer(
            r'(?P<bracketed>\(.+?\))'
            r'|'
            r'(?P<unbracketed>((?<=\))|^).+?((?=\()|$))',
            line,
        )
    ):
        if unbracketed:
            options.append([unbracketed])
        elif bracketed:
            options.append(bracketed.strip('()').split('|'))

    return options


def build_parts():
    street_names_a = []
    street_names_b = []
    active_street_name_list = None

    with open('streetnames.txt', 'rt') as snf:
        for line in snf.readlines():
            names = [n for n in line.strip().split('|') if n]

            if not names:
                continue
            elif names == ['A']:
                active_street_name_list = street_names_a
            elif names == ['B']:
                active_street_name_list = street_names_b
            elif active_street_name_list is not None:
                active_street_name_list.append(names)

    with open('placenames.txt') as pnf:
        place_names = [pn.strip() for pn in pnf.readlines() if pn.strip()]

    sprites = []
    for sprite in os.listdir('sprites'):
        prefix = os.path.splitext(sprite)[0]
        (name, *tags) = prefix.split('-')
        sprites.append({
            'prefix': prefix,
            'name': name,
            'tags': tags,
            'path': os.path.join('sprites', sprite),
        })

    clients = []
    client_path = os.path.join('small-art', 'clients')
    for client in os.listdir(client_path):
        clients.append({
            'prefix': os.path.splitext(client)[0],
            'path': os.path.join(client_path, client),
        })

    steps = []
    for step in os.listdir(os.path.join('floorplan', 'symbols')):
        prefix = os.path.splitext(step)[0]
        if not prefix.startswith('stairs_'):
            continue
        steps.append({
            'prefix': prefix,
            'path': os.path.join('floorplan', 'symbols', step),
        })

    life_stories = parse_sectioned_file('CustomerLifeStories.txt')
    preferences = parse_sectioned_file('CustomerPreferences.txt')

    with open('parts.js', 'w') as pf:
        pf.write("""
            var STREET_NAMES_A = {};
            var STREET_NAMES_B = {};
            var PLACE_NAMES = {};
            var FURNITURE_SPRITES = {};
            var STEP_SPRITES = {};
            var CLIENT_SPRITES = {};
            var CLIENT_STORIES = {};
            var CLIENT_PREFERENCES = {};
        """.format(
            json.dumps(street_names_a),
            json.dumps(street_names_b),
            json.dumps(place_names),
            json.dumps(sprites),
            json.dumps(steps),
            json.dumps(clients),
            json.dumps(life_stories),
            json.dumps(preferences),
        ))



def compile_less():
    with open('style.css', 'wb') as cf:
        cf.write(subprocess.check_output(['lessc', 'style.less']))


if __name__ == '__main__':
    compile_less()
    build_parts()
