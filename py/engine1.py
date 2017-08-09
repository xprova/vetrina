class MyApp(object):

    counter = 1

    def count(self, until=20):
        return list(range(until))

    def ping(self):
        return "pong!"

    def __call__(self, msg):
        if not msg:
            return {"result": "you sent an empty message"}
        if "x" not in msg:
            return {"result": "there was no x", "you sent": msg}
        else:
            self.counter += 1
            return {"result": "you said x = %s" % msg["x"],
                    "counter": self.counter}