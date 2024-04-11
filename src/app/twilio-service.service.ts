import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, identity } from 'rxjs';
import { Twilio } from 'twilio/lib';
import { Identity } from 'twilio/lib/twiml/VoiceResponse';


@Injectable({
  providedIn: 'root'
})
export class TwilioServiceService {



 private identity:string;


 // Método para generar token de acceso
 tokenGenerator(): { identity: string, token: string } {


   let identity = 'PacoClient'; // Identity for the client

  const accessToken = new Twilio.jwt.AccessToken(
    config.accountSid,
    config.apiKey,
    config.apiSecret
  );
  accessToken.identity = identity;

  const grant = new Twilio.jwt.AccessToken.VoiceGrant({
    outgoingApplicationSid: config.twimlAppSid,
    incomingAllow: true
  });
  accessToken.addGrant(grant);

  return {
    identity: identity,
    token: accessToken.toJwt()
  };
}

//para manejar respuestas de voz
voiceResponse(requestBody: any): string {


  const toNumberOrClientName = requestBody.To;
  let twiml = new Twilio.twiml.VoiceResponse();

  // If the request to the /voice endpoint is TO your Twilio Number, 
  // then it is an incoming call towards your Twilio.Device.
  if (toNumberOrClientName == config.callerId) {
    let dial = twiml.dial();

    // Por qué no consigo el identity
    dial.client('PacoClient');

  } else if (requestBody.To) {
    // This is an outgoing call

    // set the callerId
    let dial = twiml.dial({ callerId: config.callerId });

    // Check if the 'To' parameter is a Phone Number or Client Name
    // in order to use the appropriate TwiML noun 
    const attr = this.isAValidPhoneNumber(toNumberOrClientName)
      ? "number"
      : "client";
    dial[attr]({}, toNumberOrClientName);
  } else {
    twiml.say("Thanks for calling!");
  }

  return twiml.toString();
}

// Método para validar números de teléfono
private isAValidPhoneNumber(number: string): boolean {
  return /^[\d\+\-\(\) ]+$/.test(number);
}
}
