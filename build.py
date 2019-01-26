import subprocess


def compile_less():
    with open('style.css', 'wb') as cf:
        cf.write(subprocess.check_output(['lessc', 'style.less']))


if __name__ == '__main__':
    compile_less()
