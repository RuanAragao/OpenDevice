/*
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

package br.com.criativasoft.opendevice.connection.discovery;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;

/**
 * Service that allows customers to make the discovery of the web server on the network
 * 
 * @author Ricardo JL Rufino
 * @date 04/01/2014
 */
public class DiscoveryService extends Thread {
	
	private static final Logger log = LoggerFactory.getLogger(DiscoveryService.class);

    public static final int DISCOVERY_PORT = 2562;

	private static final String DISCOVER_SERVER_REQUEST = "DISCOVER_SERVER_REQUEST";
	private static final String DISCOVER_SERVER_RESPONSE = "DISCOVER_SERVER_RESPONSE";

    private int httpPort;

    /**
     * @param httpPort that should be used by clients to connect to server
     */
    public DiscoveryService(int httpPort) {
        setDaemon(true);
        this.httpPort = httpPort;
    }

    @Override
	public void run() {
		try {
			// Keep a socket open to listen to all the UDP trafic that is
			// destined for this port
            DatagramSocket socket = new DatagramSocket(DISCOVERY_PORT, InetAddress.getByName("0.0.0.0"));
			socket.setBroadcast(true);
			log.debug("Listen for requests at:" + DISCOVERY_PORT);
			
			while (true) {

				// Receive a packet
				byte[] recvBuf = new byte[15000];
				DatagramPacket packet = new DatagramPacket(recvBuf,recvBuf.length);
				socket.receive(packet);

				// Packet received
				log.debug("Received packet: <<"+ packet.getAddress().getHostAddress() + ">> : " +  new String(packet.getData()));

				// See if the packet holds the right command (message)
				String message = new String(packet.getData()).trim();
				
				if (message.contains(DISCOVER_SERVER_REQUEST)) {
					String response = DISCOVER_SERVER_RESPONSE + "={port:"+httpPort+"}";  // TODO: Adicionar informações da porta.
					byte[] sendData = response.getBytes();
					DatagramPacket sendPacket = new DatagramPacket(sendData,sendData.length, packet.getAddress(),packet.getPort());
					socket.send(sendPacket);

					log.debug("Sent response to: "+ sendPacket.getAddress().getHostAddress());
				}
			}
		} catch (IOException ex) {
            ex.printStackTrace();
		}
	}


    /**
     * Start the service discovery
     * @see br.com.criativasoft.opendevice.connection.discovery.DiscoveryService
     * @param httpPort that should be used by clients to connect to server
     */
    public static void listen(int httpPort){
        new DiscoveryService(httpPort).start();
    }

}
