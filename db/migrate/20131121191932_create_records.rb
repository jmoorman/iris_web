class CreateRecords < ActiveRecord::Migration
  def change
    create_table :records do |t|
      t.integer :user_id
      t.string :subject
      t.datetime :date_taken
      t.decimal :score
      t.decimal :quality
      t.text :file

      t.timestamps
    end
  end
end
