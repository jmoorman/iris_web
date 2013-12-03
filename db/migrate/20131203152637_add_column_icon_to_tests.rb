class AddColumnIconToTests < ActiveRecord::Migration
  def change
    add_column :tests, :icon, :string
  end
end
