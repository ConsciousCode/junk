class CreateTransactions < ActiveRecord::Migration
  def change
    create_table :transactions do |t|
      t.integer :user_from
      t.integer :user_to
      t.integer :amount

      t.timestamps null: false
    end
  end
end
