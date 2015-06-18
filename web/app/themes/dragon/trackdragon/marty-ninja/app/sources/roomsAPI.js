var _ = require('lodash');
var Marty = require('marty');

class RoomHttpAPI extends Marty.HttpStateSource {
  getAllRooms() {
    return this.get('/api/rooms').then(function (res) {
      return res.json();
    });
  }
  getRoom(id) {
    return this.get('/api/rooms/' + id).then(function (res) {
      return res.json();
    });
  }
  createRoom(room) {
    return this.post({
      url: '/api/rooms',
      body: _.omit(room, 'cid')
    });
  }
}

module.exports = RoomHttpAPI;