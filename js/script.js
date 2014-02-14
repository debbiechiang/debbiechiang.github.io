var philo = {
	existingDevices: {},
	templateHTML: [],
	showError: false,
	addDevice: function(e){
		e.preventDefault();

		var $target = $(e.target);
		var val = $.trim($target.find('input').val());

		if (val == ''){ 
			// if no user input, get out. 
			return;
		} else if (this.isInList(val, this.existingDevices)){
			// if the input is a dupe, show error. 
			this.showError = true;
			this.renderDevices();
		}else {
			// generate an id based on the date to keep things unique & in order
			var id = Date.now();
			this.existingDevices[id] = val;
			this.$newDevice.val('');
			this.renderDevices();
		}

	}, 
	editEntry: function(e){
		var $target = $(e.target);
		var $entry = $target.siblings('.editField');
		var $listing = $target.parent();

		// store the original value of the field
		philo.currVal = $.trim($entry.val());

		$listing.addClass('editing'); 

		$entry.trigger('focus');
	},
	deleteEntry: function(e){
		var $target = $(e.target);
		var id = $target.parent().attr('id');
		var conf = confirm("Are you sure you want to delete this device?");
		if (conf){
			delete this.existingDevices[id];
			this.renderDevices();
		}
	},
	listenKeyup: function(e){
		// If the user hits 'enter'
		if (e.keyCode === 13){
			$(e.target).trigger('blur');
		}
	},
	blurEntry: function(e){
		// this setTimeout is to fix an issue where trying to delete 
		// multi-line device names while in an 'editing' state failed because 
		// blurring the single-line input would immediately move the delete 
		// button, rendering it unclickable. Weird. Sorry.
		var delay = setTimeout(function(){
			var $target = $(e.target);
			var val = $.trim($target.val()); 
			var $listing = $target.parent();
			var id = $target.parent().attr('id');

			if (val != philo.currVal){
				// if the user made a change
				if (val == ''){
					this.deleteEntry(e);
				}else if (this.isInList(val, this.existingDevices)){
					this.showError = true; 
					this.renderDevices();
				}else{
					this.existingDevices[id] = $.trim($target.val()); 
					this.renderDevices();
				}
			}
			$listing.removeClass('editing');
		}.bind(this), 10);
	},
	init: function(){
		// cache elements
		this.$app = $('#app');
		this.$list =  this.$app.find('#deviceList');
		this.$addForm = this.$app.find('#addForm');
		this.$newDevice = this.$addForm.find('#newDevice');
		this.$error = this.$app.find('.error');

		// bind events
		this.$addForm.on('submit', this.addDevice.bind(this));
		this.$list.on('click', '.edit', this.editEntry.bind(this));
		this.$list.on('click', '.delete', this.deleteEntry.bind(this));
		this.$list.on('keyup', '.editField', this.listenKeyup);
		this.$list.on('blur', '.editField', this.blurEntry.bind(this));
	
		// cue the user
		this.$newDevice.trigger('focus');
	},
	isInList: function(val, collection){
		for (var key in collection){
			if (collection.hasOwnProperty(key)){
				if(collection[key] === val){
					return true;
				}
			}
		}
		return false;
	},
	renderDevices: function(){
		var collection = this.existingDevices;

		// empty the array
		this.templateHTML.length = 0;
		
		// show or hide the error
		(this.showError) ? this.$error.show() : this.$error.hide();

		for (key in collection){
			philo.templateHTML.push('<li class="item" id="' + key + '"><span class="currVal">' + collection[key] + '</span><input type="text" class="editField" value="' + collection[key] + '" /><button class="edit" type="button">edit</button><button class="delete" type="button">delete</button></li>')
		}

		this.$list.html(this.templateHTML.join(''));

		// reset error state.
		this.showError = false;
	}
}

$(document).ready(function(){
	philo.init();
});