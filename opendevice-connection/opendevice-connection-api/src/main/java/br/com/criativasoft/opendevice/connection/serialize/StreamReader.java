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

package br.com.criativasoft.opendevice.connection.serialize;

import java.io.InputStream;

import br.com.criativasoft.opendevice.connection.AbstractStreamConnection;

public interface StreamReader {
	
	public void setInput(InputStream input);
	
	public void processPacketRead(byte read[]);
	
	public void checkDataAvalible();
	
	public void setConnection(AbstractStreamConnection connection);
	
	public AbstractStreamConnection getConnection();
}
