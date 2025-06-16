
const GOOGLE_CLIENT_ID = '943597947672-f8pvbap2db3eere4uaoakvnu8ifh6khm.apps.googleusercontent.com';
const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/userinfo.profile'
].join(' ');

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
}

export class GoogleAuthService {
  private static instance: GoogleAuthService;
  private gapi: any = null;
  private auth2: any = null;

  static getInstance(): GoogleAuthService {
    if (!GoogleAuthService.instance) {
      GoogleAuthService.instance = new GoogleAuthService();
    }
    return GoogleAuthService.instance;
  }

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.gapi) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        window.gapi.load('auth2', () => {
          this.gapi = window.gapi;
          this.gapi.auth2.init({
            client_id: GOOGLE_CLIENT_ID,
            scope: GOOGLE_SCOPES
          }).then(() => {
            this.auth2 = this.gapi.auth2.getAuthInstance();
            resolve();
          }).catch(reject);
        });
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async signIn(): Promise<GoogleUser> {
    await this.initialize();
    const authResult = await this.auth2.signIn();
    const profile = authResult.getBasicProfile();
    
    const user: GoogleUser = {
      id: profile.getId(),
      email: profile.getEmail(),
      name: profile.getName(),
      picture: profile.getImageUrl()
    };

    localStorage.setItem('google_user', JSON.stringify(user));
    localStorage.setItem('google_token', authResult.getAuthResponse().access_token);
    
    return user;
  }

  async signOut(): Promise<void> {
    if (this.auth2) {
      await this.auth2.signOut();
    }
    localStorage.removeItem('google_user');
    localStorage.removeItem('google_token');
  }

  getStoredUser(): GoogleUser | null {
    const stored = localStorage.getItem('google_user');
    return stored ? JSON.parse(stored) : null;
  }

  getAccessToken(): string | null {
    return localStorage.getItem('google_token');
  }

  isSignedIn(): boolean {
    return !!this.getStoredUser() && !!this.getAccessToken();
  }
}
