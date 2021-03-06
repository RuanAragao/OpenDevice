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

package br.com.criativasoft.opendevice.restapi.service;

import br.com.criativasoft.opendevice.core.command.ResponseCommand;

/**
 * TODO: PENDING DOC (Not Used !!)
 *
 * @author Ricardo JL Rufino
 * @date 04/07/14.
 */
public interface DeviceService {

    ResponseCommand setValue(int uid, String value);

    String getValue(int uid);

    String delete(int uid);
}
