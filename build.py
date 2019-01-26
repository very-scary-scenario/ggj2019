import json
import os
import subprocess


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

    steps = []
    for step in os.listdir(os.path.join('floorplan', 'symbols')):
        prefix = os.path.splitext(step)[0]
        if not prefix.startswith('stairs_'):
            continue
        steps.append({
            'prefix': prefix,
            'path': os.path.join('floorplan', 'symbols', step),
        })

    with open('parts.js', 'w') as pf:
        pf.write("""
            var STREET_NAMES_A = {};
            var STREET_NAMES_B = {};
            var PLACE_NAMES = {};
            var FURNITURE_SPRITES = {};
            var STEP_SPRITES = {};
        """.format(
            json.dumps(street_names_a),
            json.dumps(street_names_b),
            json.dumps(place_names),
            json.dumps(sprites),
            json.dumps(steps),
        ))



def compile_less():
    with open('style.css', 'wb') as cf:
        cf.write(subprocess.check_output(['lessc', 'style.less']))


if __name__ == '__main__':
    compile_less()
    build_parts()
