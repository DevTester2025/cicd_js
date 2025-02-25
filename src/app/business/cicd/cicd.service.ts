import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class CicdService {

  private key = CryptoJS.enc.Utf8.parse('BZnEPAobtWKE1qQRJjkZASafxE2NjwSq');
  private iv = CryptoJS.enc.Utf8.parse('vPdL86XAlk24uSaZ');
  private treeTableTemplateSubject = new BehaviorSubject<any>(null);
  treeTableTemplate$ = this.treeTableTemplateSubject.asObservable();

  encrypt(text: string): string {
    const encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(text), this.key, {
      keySize: 128 / 8,
      iv: this.iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString();
  }

  decrypt(decString: string): string {
    const decrypted = CryptoJS.AES.decrypt(decString, this.key, {
      keySize: 128 / 8,
      iv: this.iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  }
  setTreeTableTemplateData(templateData: any): void {
    this.treeTableTemplateSubject.next(templateData);
  }
}
