import crypto from "crypto";

export default class WebAuthn {
  private _generateRandomBytes(): Buffer {
    return crypto.randomBytes(16);
  }

  async create({ username }: { username: string }): Promise<Credential | null> {
    const options: PublicKeyCredentialCreationOptions = {
      timeout: 60000,
      rp: {
        name: "hocuspocusxyz",
        id: "localhost",
      },
      user: {
        id: this._generateRandomBytes(),
        name: username,
        displayName: username,
      },
      pubKeyCredParams: [
        { alg: -8, type: "public-key" }, // Ed25519
        { alg: -7, type: "public-key" }, // ES256
        { alg: -257, type: "public-key" }, // RS256
      ],
      authenticatorSelection: {
        //     authenticatorAttachment: "cross-platform",
        requireResidentKey: true,
        userVerification: "required",
      },
      // extensions: {
      //   prf: {
      //     eval: {
      //       first: new TextEncoder().encode("Foo encryption key").buffer,
      //     },
      //   },
      // } as AuthenticationExtensionsClientInputs,
      // Challenge is unused during registration, but must be present
      challenge: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]).buffer,
    };

    const credential = await navigator.credentials.create({
      publicKey: options,
    });

    console.log("CREATE CREDENTIAL: ", credential);
    return credential;
  }

  async get(): Promise<Credential | null> {
    const options: PublicKeyCredentialRequestOptions = {
      timeout: 60000,
      challenge: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]).buffer,
      rpId: "localhost",
      userVerification: "required",
      extensions: {
        prf: {
          // hmacCreateSecret: true,
          eval: {
            first: new TextEncoder().encode("Foo encryption key").buffer,
          },
        },
      } as AuthenticationExtensionsClientInputs,
    };

    const credential = await navigator.credentials.get({
      publicKey: options,
    });

    // const result = btoa(
    //   String.fromCharCode.apply(
    //     null,
    //     new Uint8Array(
    //       credential.getClientExtensionResults().prf.results.first
    //     ) as any
    //   )
    // );

    // console.log(
    //   "CREDENTIAL: ",
    //   new TextDecoder("utf-8").decode(
    //     new Uint8Array((credential as any).response.clientDataJSON)
    //   )
    // );
    console.log("GET CREDENTIAL: ", credential);
    return credential;
  }
}
