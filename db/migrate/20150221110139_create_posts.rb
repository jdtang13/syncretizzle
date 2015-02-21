class CreatePosts < ActiveRecord::Migration
  def change
    create_table :posts do |t|
      t.int :source
      t.int :generation
      t.text :content

      t.timestamps
    end
  end
end
