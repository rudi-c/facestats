#!/usr/bin/python

import argparse
import random

from datetime import datetime, timedelta

import names
from loremipsum import get_sentences
from yattag import Doc

doc, tag, text = Doc().tagtext()
your_name = names.get_full_name()

def timeformat(time):
    return time.strftime("%A, %B %d, %Y at %I:%M%p PST")

def generate_thread(mean_thread_size):
    thread_size = int(random.expovariate(1.0 / mean_thread_size))

    # Generate random name
    parties = [your_name, names.get_full_name()]

    starting_time = datetime.now()

    with tag('div', klass='thread'):
        text(", ".join(parties))
        for _ in xrange(thread_size):
            # Mean two minutes between messages
            message_time = starting_time
            starting_time = starting_time + timedelta(
                    minutes = random.expovariate(1.0 / 2))
            with tag('div', klass='message'):
                with tag('div', klass='message_header'):
                    with tag('span', klass='user'):
                        text(random.choice(parties))
                    with tag('span', klass='meta'):
                        text(timeformat(message_time))
            with tag('p'):
                # For now, always generate just one sentence
                text(''.join(get_sentences(1)))

def generate(thread_count, mean_thread_size):
    with tag('html'):
        with tag('body'):
            with tag('div', klass='contents'):
                with tag('h1'):
                    text(your_name)
                with tag('div'):
                    for _ in xrange(thread_count):
                        generate_thread(mean_thread_size)
    print doc.getvalue()

parser = argparse.ArgumentParser()
parser.add_argument("--thread-count", type=int, required=True,
                    help="number of conversation threads to generate")
parser.add_argument("--thread-size", type=int, required=True,
                    help="mean of the number of messages in a thread")

args = parser.parse_args()

generate(args.thread_count, args.thread_size)


