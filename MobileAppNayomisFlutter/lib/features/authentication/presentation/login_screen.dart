import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/design_system/app_colors.dart';
import '../../../core/design_system/app_spacing.dart';
import '../../../core/design_system/widgets/brand_logo.dart';
import '../../../core/validation/validators.dart';
import '../../../shared/widgets/app_widgets.dart';
import '../application/auth_controller.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({
    super.key,
    this.prefilledEmail,
    this.registered = false,
    this.intendedRoute,
  });

  final String? prefilledEmail;
  final bool registered;
  final String? intendedRoute;

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _email;
  final _password = TextEditingController();
  bool _obscure = true;

  @override
  void initState() {
    super.initState();
    _email = TextEditingController(text: widget.prefilledEmail ?? '');
  }

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    FocusScope.of(context).unfocus();
    final success = await ref
        .read(authControllerProvider.notifier)
        .login(_email.text, _password.text);
    _password.clear();
    if (success && mounted) context.go(widget.intendedRoute ?? '/home');
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authControllerProvider);
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 440),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Center(child: BrandLogo(size: 104)),
                  const SizedBox(height: AppSpacing.md),
                  Text(
                    "Nayomi's Waterfront",
                    style: Theme.of(context).textTheme.headlineMedium,
                    textAlign: TextAlign.center,
                  ),
                  if (widget.registered) ...[
                    const SizedBox(height: AppSpacing.lg),
                    const Card(
                      child: ListTile(
                        leading: Icon(
                          Icons.check_circle_outline,
                          color: AppColors.statusSuccess,
                        ),
                        title: Text('Account created'),
                        subtitle: Text('Log in with your new account.'),
                      ),
                    ),
                  ],
                  const SizedBox(height: AppSpacing.xl),
                  AutofillGroup(
                    child: Form(
                      key: _formKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
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
                            autofillHints: const [AutofillHints.password],
                            validator: Validators.password,
                            onFieldSubmitted: (_) => _submit(),
                            decoration: InputDecoration(
                              labelText: 'Password',
                              prefixIcon: const Icon(Icons.lock_outline),
                              suffixIcon: IconButton(
                                tooltip: _obscure
                                    ? 'Show password'
                                    : 'Hide password',
                                onPressed: () =>
                                    setState(() => _obscure = !_obscure),
                                icon: Icon(
                                  _obscure
                                      ? Icons.visibility_outlined
                                      : Icons.visibility_off_outlined,
                                ),
                              ),
                            ),
                          ),
                          if (auth.hasError) ...[
                            const SizedBox(height: AppSpacing.sm),
                            Semantics(
                              liveRegion: true,
                              child: Text(
                                auth.error.toString(),
                                style: const TextStyle(
                                  color: AppColors.statusCritical,
                                ),
                              ),
                            ),
                          ],
                          const SizedBox(height: AppSpacing.lg),
                          PrimaryButton(
                            label: 'Log in',
                            loading: auth.isLoading,
                            onPressed: _submit,
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  Center(
                    child: TextButton(
                      onPressed: auth.isLoading
                          ? null
                          : () => context.push('/register'),
                      child: const Text("New to Nayomi's? Sign up"),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
