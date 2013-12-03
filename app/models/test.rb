class Test < ActiveRecord::Base
  has_many :records

  validates_presence_of :name
  validates_uniqueness_of :name

  validates_presence_of :object
end
