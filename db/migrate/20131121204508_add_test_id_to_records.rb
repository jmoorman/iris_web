class AddTestIdToRecords < ActiveRecord::Migration
  def change
    add_column :records, :test_id, :integer 
  end
end
