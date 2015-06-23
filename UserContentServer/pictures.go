package main

import (
  "github.com/MGrin/ContentService"
)

const (
  PORT = 7896
  DB = "mongodb://localhost:34563"
  DB_NAME = "eventorio"
  ORIG_PATH = "/home/admin/pictures"
)
func main() {
  var service, err = ContentService.Create(ORIG_PATH, DB, DB_NAME)
  if err != nil {
    panic(err)
  }

  service.Start(PORT)
}