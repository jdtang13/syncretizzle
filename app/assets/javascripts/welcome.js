// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.
// You can use CoffeeScript in this file: http://coffeescript.org/

$(function(){
	var firebaseRef = new Firebase("https://syncretizzle.firebaseio.com/");
	
	var Room = Backbone.Firebase.Model.extend({
		urlRoot: "https://syncretizzle.firebaseio.com/rooms"
	});

	var room = new Room({
		id: 1
	});


	var Todo = Backbone.Model.extend({

	    // Default attributes for the todo item.
	    defaults: function() {
	    	return {
	    		title: "empty todo...",
	    		order: Todos.nextOrder(),
	    		done: false
	    	};
	    },

	    // Toggle the `done` state of this todo item.
	    toggle: function() {
	    	this.save({done: !this.get("done")});
	    }

	});	
});