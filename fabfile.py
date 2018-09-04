from fabric.api import run
from fabric.api import cd
from fabric.api import env
from fabric.api import put
from fabric.api import local
from fabric.operations import sudo

env.use_ssh_config = True
VETRINA_DIR        = "/var/www/vetrina"

files = [
    "README.md",
    "bs-config.js",
    "css",
    "dev",
    "doc",
    "gates",
    "graphs",
    "htm",
    "index.htm",
    "js",
    "package.json",
    "poets"
]

def deploy():
    with cd(VETRINA_DIR):
        local("tar czf vetrina.tar.gz %s" % " ".join(files))
        put("vetrina.tar.gz", "vetrina.tar.gz")
        local("rm vetrina.tar.gz")
        run("tar xzf vetrina.tar.gz")
