"use server";

// TODO: Wire up Firebase auth in the next step of the tutorial

export async function signUp(params: SignUpParams) {
  // Will be implemented with Firebase
  return { success: false, message: "Not implemented yet" };
}

export async function signIn(params: SignInParams) {
  // Will be implemented with Firebase
  return { success: false, message: "Not implemented yet" };
}

export async function signOut() {
  // Will be implemented with Firebase
  return { success: false };
}

export async function getCurrentUser(): Promise<User | null> {
  // Will be implemented with Firebase
  return null;
}

export async function isAuthenticated(): Promise<boolean> {
  // Will be implemented with Firebase — returning true for now so the UI loads
  return true;
}
