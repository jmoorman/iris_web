window.unload = function() {}

var Iris = { APIVersion : "0.0.1" };

if ((typeof(WebSocket) == 'undefined') && (typeof(MozWebSocket) != 'undefined')) WebSocket = MozWebSocket;

Iris.Controller = function(connection)
{
  this._frames = [];
  this._connect(connection);
  this._imageCallbacks = [];
  this._logCallbacks = [];
}

Iris.Controller.prototype = 
{
  isConnected : function() 
  {
    return this._socket.connected;
  },

  beginCalibration : function()
  {
    if(!this._socket.connected) return false;
    this._socket.send(JSON.stringify( {"type" : "calibrate", 
                                       "data" : true
                                      }));
  },

  endCalibration : function()
  {
    if(!this._socket.connected) return false;
    this._socket.send(JSON.stringify( {"type" : "calibrate", 
                                       "data" : false
                                      }));
  },

  beginTracking : function(subscribe)
  {
    if(!this._socket.connected) return false;
    subscribe = typeof subscribe == "boolean" ? subscribe : false;
    this._socket.send(JSON.stringify( {"type" : "track", 
                                       "data" : true, 
                                       "subscribe" : subscribe
                                      }));
  },

  endTracking : function()
  {
    if(!this._socket.connected) return false;
    this._socket.send(JSON.stringify( {"type" : "track", 
                                       "data" : false
                                      }));
  },

  setTarget : function(x, y)
  {
    if(!this._socket.connected) return false;
    if(typeof x != "number" || typeof y != "number")
    {
      x = -1;
      y = -1;
    }
    this._socket.send(JSON.stringify( {"type" : "target", 
                                       "data" : { "x" : x, "y" : y }
                                      }));
  },

  requestImage : function(callback)
  {
    if(!this._socket.connected) return false;
    this._imageCallbacks.push(callback);
    this._socket.send(JSON.stringify( {"type" : "request",
                                       "data" : "image"
                                      }));
  },
  
  requestLog : function(callback)
  {
    if(!this._socket.connected) return false;
    this._logCallbacks.push(callback);
    this._socket.send(JSON.stringify( {"type" : "request",
                                       "data" : "log"
                                      }));
  },

  showImage : function(canvas)
  {
     var context = canvas.getContext('2d');
     var image_data = context.getImageData(0, 0, canvas.width, canvas.height);
     for (var i = 0; i < this._image.length; i++) {
       image_data.data[i * 4] = this._image[i];
       image_data.data[1 + i * 4] = this._image[i];
       image_data.data[2 + i * 4] = this._image[i];
       image_data.data[3 + i * 4] = 255;
     }
     context.putImageData(image_data, 0, 0);
  },

  _onmessage : function(event)
  {
    if(typeof event.data === "string")
    {
      var eventData = JSON.parse(event.data);
      if (eventData.type == "log")
      {
        this._log = eventData.data;
        this._score = eventData.score;
        setTimeout(this._logCallbacks.pop(), 5);
      }
    }
    else
    {
      this._image = new Uint8Array(event.data);
      setTimeout(this._imageCallbacks.pop(), 5);
    }
  },

  _connect : function(connection)
  {
    if (typeof(WebSocket) == 'undefined') return;
    
    if(this._socket) delete this._socket;
    if(this._image) delete this._image;
    this._socket = new WebSocket(connection);
    this._socket.binaryType = "arraybuffer";
    this._socket._controller = this;
    this._socket.connected = false;
    
    this._socket.onmessage = function(event)
    {
      this._controller._onmessage(event);
    };
    
    this._socket.onopen = function(event)
    {
      this.connected = true;
    };
    
    this._socket.onclose = function(event)
    {
      this.connected = false;
      var me = this;
      setTimeout(function(){ me._controller._connect(me.url); }, 1000);
    };
    
    this._socket.onerror = function(event)
    { 
      //this.onclose(event);
    };
  }
}
