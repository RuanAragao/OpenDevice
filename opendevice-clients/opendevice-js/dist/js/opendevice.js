/*
 *
 *  * ******************************************************************************
 *  *  Copyright (c) 2013-2014 CriativaSoft (www.criativasoft.com.br)
 *  *  All rights reserved. This program and the accompanying materials
 *  *  are made available under the terms of the Eclipse Public License v1.0
 *  *  which accompanies this distribution, and is available at
 *  *  http://www.eclipse.org/legal/epl-v10.html
 *  *
 *  *  Contributors:
 *  *  Ricardo JL Rufino - Initial API and Implementation
 *  * *****************************************************************************
 *
 */

var od = od || {};

// Like OpenDevice JAVA-API
od.DeviceType = {
    ANALOG:1,
    DIGITAL:2,
    SENSOR:3 // TODO: ver se é necessário
};

// Like OpenDevice JAVA-API
od.DeviceCategory = {
    LAMP:1,
    FAN:2,
    GENERIC:3,
    POWER_SOURCE : 4,
    GENERIC_SENSOR: 50,
    IR_SENSOR: 51
};

od.CommandType = {
    ON_OFF:1,
    ANALOG:2,
    ANALOG_REPORT:3,
    GPIO_DIGITAL:4, // Controle a nivel logico do PINO (diferente do ON_OFF que pode ligar/desligar varios pinos)
    GPIO_ANALOG:5, // Controle de baixo nivel

    /** Response to commands like: ON_OFF, POWER_LEVEL, INFRA RED  */
    DEVICE_COMMAND_RESPONSE : 10, // Responsta para comandos como: ON_OFF, POWER_LEVEL, INFRA_RED

    PING_REQUEST : 20, // Verificar se esta ativo
    PING_RESPONSE : 21, // Resposta para o Ping
    MEMORY_REPORT : 22, // Relatorio de quantidade de memória (repora o atual e o máximo).
    CPU_TEMPERATURE_REPORT : 23,
    CPU_USAGE_REPORT:24,
    GET_DEVICES : 30,
    GET_DEVICES_RESPONSE : 31,

    isDeviceCommand : function(type){
        switch (type) {
            case this.ON_OFF:
                return true;
            case this.ANALOG:
                return true;
            case this.ANALOG_REPORT:
                return true;
            default:
                break;
        }
        return false;
    }
};

od.CommandType



od.DeviceEvent = {
    DEVICE_LIST_UPDATE : "DEVICE_LIST_UPDATE",
    DEVICE_UPDATE : "DEVICE_UPDATE",
    DEVICE_CHANGED : "DEVICE_UPDATE", // ALIAS !
    CONNECTION_CHANGE : "CONNECTION_CHANGE"
};/*
 *
 *  * ******************************************************************************
 *  *  Copyright (c) 2013-2014 CriativaSoft (www.criativasoft.com.br)
 *  *  All rights reserved. This program and the accompanying materials
 *  *  are made available under the terms of the Eclipse Public License v1.0
 *  *  which accompanies this distribution, and is available at
 *  *  http://www.eclipse.org/legal/epl-v10.html
 *  *
 *  *  Contributors:
 *  *  Ricardo JL Rufino - Initial API and Implementation
 *  * *****************************************************************************
 *
 */

/** @namespace */
var od = od || {};


/**
 * Represent a Device
 * @param data - JSON
 * @constructor
 */
od.Device = function(data){
    this.id = data.id;
    this.name = data.name;
    this.type = data.type;
    this.category = data.category;
    this.value = data.value;
    this.sensor = data.sensor;
    this.manager = od.deviceManager;

    this.setValue = function(value){
        this.value = value;

        if(this.manager){
            this.manager.setValue(this.id, this.value);
        }
    }

    this.toggleValue = function(){
        var value = 0;
        if(this.value == 0) value = 1;
        else if(this.value == 1) value = 0;
        this.setValue(value);
    }

};/*
 * ******************************************************************************
 *  Copyright (c) 2013-2014 CriativaSoft (www.criativasoft.com.br)
 *  All rights reserved. This program and the accompanying materials
 *  are made available under the terms of the Eclipse Public License v1.0
 *  which accompanies this distribution, and is available at
 *  http://www.eclipse.org/legal/epl-v10.html
 *
 *  Contributors:
 *  Ricardo JL Rufino - Initial API and Implementation
 * *****************************************************************************
 */



/** @namespace */
var od = od || {};

/** global instance. @type {{od.DeviceConnection}} */
od.connection = {};

od.ConnectionStatus = {
    CONNECTING: 1,
    CONNECTED : 2,
    DISCONNECTING :3,
    DISCONNECTED : 4,
    // LOGGINGIN : 5,
    FAIL : 6
};

/**
 * Represent a connection with server.
 * // TODO: adicionar documentação...
 * @param config
 * @constructor
 */
od.DeviceConnection = function(config){

    // Alias
    var Status = od.ConnectionStatus;

    // Private
    var socket = window.atmosphere || $.atmosphere;
    var serverConnection;
    var _this = this;
    var listeners = [];

    od.connection = this; // set global instance

    // public
    this.status = Status.DISCONNECTED;
    this.config = config;
    this.url = config.url;

    init(config);

    function init(_config){
        _config.url += ("/device/connection/" + _config.applicationID); // set end point .
        // _config.dropHeaders = false;

        if(_config["contentType"] == undefined)       _config["contentType"] = "application/json";
        if(_config["transport"] == undefined)         _config["transport"]   = "websocket";
        if(_config["fallbackTransport"] == undefined) _config["fallbackTransport"] = "long-polling";
        if(_config["reconnectInterval"] == undefined) _config["reconnectInterval"] = 5000;
        if(_config["maxReconnectOnClose"] == undefined) _config["maxReconnectOnClose"] = 5;


        _config.onError = function (response) {
            console.log("Connection.onError");
            setConnectionStatus(Status.FAIL);
        };

        _config.onMessage = function (response) {
            _onMessageReceived(response);
        };

        _config.onMessagePublished = function (response) {
            console.log("Connection.onMessagePublished");
        };

        // -----------------

        _config.onClose = function (response) {
            console.log("Connection.onClose");
            setConnectionStatus(Status.DISCONNECTED);
        };

        _config.onOpen = function (response) {
            console.log("Connection.onOpen");
            setConnectionStatus(Status.CONNECTED);
        };

        _config.onReopen = function (response) {
            console.log("Connection.onReopen");
            setConnectionStatus(Status.CONNECTED);
        };

        _config.onReconnect = function (response) {
            console.log("Connection.onReconnect");
            setConnectionStatus(Status.CONNECTING);
        };

        _config.onTransportFailure = function (response) {
            console.log("Connection.onTransportFailure");
            setConnectionStatus(Status.FAIL);
        };

        _config.onFailureToReconnect = function (response) {
            console.log("Connection.onFailureToReconnect");
            setConnectionStatus(Status.DISCONNECTED);
        };

        _config.onClientTimeout = function (response) {
            console.log("Connection.onClientTimeout");
            setConnectionStatus(Status.FAIL);
        };


    };

    this.connect = function(){
        console.log("Connection to: " + config.url);
        serverConnection = socket.subscribe(config);
        setConnectionStatus(Status.CONNECTING);
        return _this;
    };

    this.send = function(data){
        // FIX: bug no atmophere que não enviar os headers da primeira conexao // TODO: registrar ticket
        // Somente na re-conexao ele passa a enviar...
        // NOTA: Isso já foi RESOLVIDO! injetando o "@Context AtmosphereResource", mas de qualquer maneira continua
        // existindo esse problema no atmophere
        // data["connectionUUID"] = serverConnection.getUUID();

        serverConnection.push(JSON.stringify(data));

    };

    this.addListener = function(listener){
        listeners.push(listener);
    };

    this.isConnected = function(){
        return _this.status = Status.CONNECTED;
    };

    this.getConnectionUUID = function(){
        return serverConnection.getUUID();
    }

    function notifyListeners(data){
        for(var i = 0; i<listeners.length; i++){
            var listener = listeners[i]["onMessageReceived"];
            if (typeof listener === "function") {
                listener(_this, data);
            }
        }
    }

    function setConnectionStatus(status){
        
        for(var i = 0; i<listeners.length; i++){
            var listener = listeners[i]["connectionStateChanged"];
            if (typeof listener === "function") {
                listener(_this, status, this.status);
            }
        }

        this.status = status;
    }

    function _onMessageReceived(response){

        try {
            var data = JSON.parse(response.responseBody);

            console.log("Connection.onMessageReceived(from:" + response.request.uuid + ") -> " + response.responseBody);

            notifyListeners(data);
        }
        catch(err) {
            console.error(" Can't parse response -> " + response.responseBody);
        }


    }
}/*
 * ******************************************************************************
 *  Copyright (c) 2013-2014 CriativaSoft (www.criativasoft.com.br)
 *  All rights reserved. This program and the accompanying materials
 *  are made available under the terms of the Eclipse Public License v1.0
 *  which accompanies this distribution, and is available at
 *  http://www.eclipse.org/legal/epl-v10.html
 *
 *  Contributors:
 *  Ricardo JL Rufino - Initial API and Implementation
 * *****************************************************************************
 */


/** @namespace */
var od = od || {};

/** global instance. @type {{od.DeviceManager}} */
od.deviceManager = {};




/**
 * DeviceManager
 * @param {DeviceConnection} connection (Optional)
 * @constructor
 */
od.DeviceManager = function(connection){

    od.deviceManager = this; // set global reference

    // Alias
    var _this = this;
    var DEvent = od.DeviceEvent;
    var CType = od.CommandType;

    // Private
    var devices = [];
    var listenersMap = {};

    // public
    this.connection = connection || od.connection;


    function init(){
        _this.connection.addListener({
            "onMessageReceived" : _onMessageReceived,
            "connectionStateChanged" : _connectionStateChanged
        });
    }

    this.setValue = function(deviceID, value){

        var cmd = { 'type' : CType.ON_OFF , 'deviceID' :  deviceID, 'value' : value};
        this.connection.send(cmd);

        var device = this.findDevice(deviceID);

        if(device){
            device.value = value;
            notifyListeners(DEvent.DEVICE_UPDATE, device);
        }

        // TODO :Alterar dados locais (localstorage)

    };

    this.toggleValue = function(deviceID){

        var device = this.findDevice(deviceID);

        if(device){
            device.toggleValue();
        }

    };

    this.addDevice = function(){
        // Isso teria no final que salvar na EPROM do arduino.
    }


    this.getDevices = function(){

        if(devices && devices.length > 0) return devices; // return from cache...

        // load remote.
        devices = sync(false);

        return devices;
    }

    this.findDevice = function(deviceID){
        if(devices){
            for(var i = 0; i < devices.length; i++){
                if(devices[i].id == deviceID){
                    return devices[i];
                }
            }
        } else{
            console.warn("Devices not loaded or empty !");
        }

        return null;
    };

    /**
     * Sync Devices with server
     * @param {Boolean} notify - if true notify listeners
     * @returns {Array}
     */
     function sync(notify){

        // try local storage
        devices =  _getDevicesLocalStorege();
        if(devices && devices.length > 0) return devices;

        // load remote.
        devices = _getDevicesRemote();

        if(notify === true) notifyListeners(DEvent.DEVICE_LIST_UPDATE, devices);

        // TODO: salvar no localstore..

        return devices;
    };

    /**
     * Shortcut to {@link addListener}
     */
    this.on = function(){
        this.addListener.apply(this, arguments);
    }

    this.addListener = function(event, listener){

        if(listenersMap[event] === undefined) listenersMap[event] = [];
        listenersMap[event].push(listener);

    };


    function notifyListeners(event, data){

        if(! (listenersMap[event] === undefined)){ // has listeners for this event

            var listeners = listenersMap[event];

            for(var i = 0; i<listeners.length; i++){
                if (typeof listeners[i] === "function") {
                    listeners[i](data);
                }
            }

        }
    }

    function _getDevicesLocalStorege(){
        return null;
    }

    /**
     *
     * @returns Array[]
     * @private
     */
    function _getDevicesRemote(){

        var response = rest("list");

        var devices = [];

        for(var i = 0; i < response.length; i++ ){
            devices.push(new od.Device(response[i]));
        }

        return devices;
    }

    /**
     * Call DeviceRest Resource.
     *
     * @private
     * @param path
     * @returns {*}
     */
    function rest(path){
        var response = $.ajax({
            type: "GET",
            url: connection.url + "/device/" + path,
            async: false
        }).responseText;

        // TODO: fazer tratamento dos possíveis erros (como exceptions e servidor offline)

        return JSON.parse(response);
    }

    /**
     *
     * @param message
     * @private
     */
    function _onMessageReceived(conn, message){

        // HACK: Bug in broadcast, is sending back same command.
        if(CType.isDeviceCommand(message.type) && conn.getConnectionUUID() == message.connectionUUID ){
            return;
        }

        // Device changed in another client..
        if(CType.isDeviceCommand(message.type)){
            console.log("Device changed in another client..");

            var device = updateDevice(message);
            if(device){
                notifyListeners(DEvent.DEVICE_UPDATE, device);
            }
            // TODO: store changes localstore..
        }

    };

    function updateDevice(message){
        var device = _this.findDevice(message.deviceID);
        if(device){
            device.value = message.value;
        }
        return device;
    }

    function _connectionStateChanged(conn, newStatus, oldStatus){
        console.log("DeviceManager._connectionStateChanged :" + newStatus);

        if(od.ConnectionStatus.CONNECTED == newStatus){
            sync(true);
        }
    };

    init(); //
}