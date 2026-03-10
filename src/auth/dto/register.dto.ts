export class RegisterDto {
  email!: string;
  password!: string;
  // Accept both display_name (snake_case from frontend) and displayName (camelCase)
  display_name?: string;
  displayName?: string;
}
