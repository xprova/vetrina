#!/usr/bin/env python

import layoutjs


class MyApp():

    counter = 0

    def count(self, until=10):
        return list(range(until))

    def __call__(self, msg):
        if not msg:
            return {"result": "you sent an empty message"}
        if "x" not in msg:
            return {"result": "there was no x", "you sent": msg}
        else:
            self.counter += 1
            return {"result": "you said x = %s" % msg["x"],
                "counter": self.counter}


def main():
    layoutjs.run(MyApp())


if __name__ == '__main__':
    main()
