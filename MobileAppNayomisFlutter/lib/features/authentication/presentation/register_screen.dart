import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/design_system/app_colors.dart';
import '../../../core/design_system/app_spacing.dart';
import '../../../core/validation/validators.dart';
import '../../../shared/widgets/app_widgets.dart';
import '../application/auth_controller.dart';
import 'widgets/auth_screen_frame.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});
  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _confirm = TextEditingController();
  bool _obscure = true;

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _password.dispose();
    _confirm.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    FocusScope.of(context).unfocus();
    final success = await ref
        .read(registrationControllerProvider.notifier)
        .register(_name.text, _email.text, _password.text);
    _password.clear();
    _confirm.clear();
    if (success && mounted) {
      context.go(
        '/login?email=${Uri.encodeComponent(_email.text.trim())}&registered=true',
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final registration = ref.watch(registrationControllerProvider);
    return AuthScreenFrame(
      title: 'Create your account',
      subtitle: 'Join Nayomi’s for easier ordering and delivery updates.',
      footer: Center(
        child: TextButton(
          onPressed: registration.isLoading ? null : () => context.pop(),
          child: const Text('Already have an account? Sign in'),
        ),
      ),
      child: AutofillGroup(
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'Your details',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: AppSpacing.md),
              TextFormField(
                controller: _name,
                textCapitalization: TextCapitalization.words,
                textInputAction: TextInputAction.next,
                autofillHints: const [AutofillHints.name],
                validator: (value) {
                  final required = Validators.required(value, 'Full name');
                  if (required != null) return required;
                  return value!.trim().length >= 2
                      ? null
                      : 'Enter at least 2 characters.';
                },
                decoration: const InputDecoration(
                  labelText: 'Full name',
                  prefixIcon: Icon(Icons.person_outline),
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              TextFormField(
                controller: _email,
                keyboardType: TextInputType.emailAddress,
                textInputAction: TextInputAction.next,
                autofillHints: const [AutofillHints.email],
                validator: Validators.email,
                decoration: const InputDecoration(
                  labelText: 'Email',
                  hintText: 'you@example.com',
                  prefixIcon: Icon(Icons.email_outlined),
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              TextFormField(
                controller: _password,
                obscureText: _obscure,
                textInputAction: TextInputAction.next,
                autofillHints: const [AutofillHints.newPassword],
                validator: Validators.password,
                decoration: InputDecoration(
                  labelText: 'Password',
                  helperText: '6–128 characters',
                  prefixIcon: const Icon(Icons.lock_outline),
                  suffixIcon: IconButton(
                    tooltip: _obscure ? 'Show passwords' : 'Hide passwords',
                    onPressed: () => setState(() => _obscure = !_obscure),
                    icon: Icon(
                      _obscure
                          ? Icons.visibility_outlined
                          : Icons.visibility_off_outlined,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              TextFormField(
                controller: _confirm,
                obscureText: _obscure,
                autofillHints: const [AutofillHints.newPassword],
                validator: (value) =>
                    value == _password.text ? null : 'Passwords do not match.',
                onFieldSubmitted: (_) => _submit(),
                decoration: const InputDecoration(
                  labelText: 'Confirm password',
                  prefixIcon: Icon(Icons.lock_outline),
                ),
              ),
              if (registration.hasError) ...[
                const SizedBox(height: AppSpacing.sm),
                Semantics(
                  liveRegion: true,
                  child: Text(
                    registration.error.toString(),
                    style: const TextStyle(color: AppColors.statusCritical),
                  ),
                ),
              ],
              const SizedBox(height: AppSpacing.lg),
              PrimaryButton(
                label: 'Create account',
                loading: registration.isLoading,
                onPressed: _submit,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
