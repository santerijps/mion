# mion

`mion` (Minimal Object Notation) is a clean and lean alternative to JSON, which is easily converted to JSON.
It looks familiar to JSON with a minimalist syntax to ensure easy readability and a small footprint.
As an additional feature, `mion` supports list schemas, which makes it delightful to declare lists without repetition.

```text
# This is a comment!

name      "Alice"   # string
age       50        # number
is_adult  true      # boolean
naughty   null      # null

address { # White space is irrelevant
  country   "UK"
  city      "London"
  street    "123 Baker Street"
}

fruits [
  "apple"
  "banana"
  "orange"
]

people (id name age) [
  1 "Alice" 50
  2 "Bob" 60
  3 "Charlie" 45
]
```
