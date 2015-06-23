package main

import (
  "github.com/MGrin/ContentService"
)

const (
  PORT = 7896
  DB = "mongodb://localhost:27017"
  DB_NAME = "Eventorio-dev"
  ORIG_PATH = "./pictures"
)
func main() {
  var service, err = ContentService.Create(ORIG_PATH, DB, DB_NAME)
  if err != nil {
    panic(err)
  }

  service.Start(PORT)
}