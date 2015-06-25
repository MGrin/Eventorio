package main

import (
  "github.com/MGrin/ContentService"
  "os"
)

func main() {
  ENV := os.Getenv("NODE_ENV")

  var (
    PORT int
    DB string
    DB_NAME string
    ORIG_PATH string
  )
  if ENV == "production" {
    PORT = 7896
    DB = "mongodb://localhost:34563"
    DB_NAME = "eventorio"
    ORIG_PATH = "/home/admin/pictures"
  } else {
    PORT = 7896
    DB = "mongodb://localhost:27017"
    DB_NAME = "Eventorio-dev"
    ORIG_PATH = "./pictures"
  }

  var service, err = ContentService.Create(ORIG_PATH, DB, DB_NAME)
  if err != nil {
    panic(err)
  }

  service.Start(PORT)
}