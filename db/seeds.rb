# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)
tests = Test.create([
    { name: 'Smooth Pursuit', object: 'smoothpursuit', icon: 'smoothpursuit-icon'}, 
    { name: 'Leap Motion', object: 'leapmotion', icon: 'gazereader-icon'}
  ])

users = User.create([
    { email: 'fake@fake.com', password: 'fake123', password_confirmation: 'fake123' }
  ])
