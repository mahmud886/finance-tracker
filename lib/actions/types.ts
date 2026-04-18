export type ActionState = {
  success: boolean;
  message?: string;
  error?: string;
};

export const defaultActionState: ActionState = {
  success: false,
};

