class AddColumnObjectToTests < ActiveRecord::Migration
  def change
    add_column :tests, :object, :string 
  end
end
