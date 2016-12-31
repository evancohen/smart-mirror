#!/bin/bash

set -e

TMP_DIR="config_schema"

mkdir $TMP_DIR

for x in plugins/*/config.schema.json; do
  y=${x#*/}
  cp -- "$x" "$TMP_DIR/${y//\//.}"
done

zip -r "$TMP_DIR" "$TMP_DIR"
rm -r "$TMP_DIR"