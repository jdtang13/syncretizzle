class CreateRooms < ActiveRecord::Migration
  def change
    create_table :rooms do |t|

    	t.int :poll_id_first

    	t.int :poll_id_second

    	t.int :current_stage

      t.timestamps
    end
  end
end
