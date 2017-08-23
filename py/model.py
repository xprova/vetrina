class Model:

    modules = []
    connections = []

    def add_modules(self, new_modules):
        self.modules.extend(new_modules)

    def add_connections(self, new_connections):
        self.connections.extend(new_connections)

    def reset(self):
        self.modules = []
        self.connections = []
