import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore, AuthUser } from '@/store/authStore';

const schema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(1, 'Введите пароль'),
});

type FormValues = z.infer<typeof schema>;

interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      const { data } = await api.post<LoginResponse>('/api/v1/auth/login', values);
      setAuth(data.user, data.accessToken);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      if (
        err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof err.response === 'object' &&
        'status' in err.response
      ) {
        const status = (err.response as { status: number }).status;
        if (status === 429) {
          setServerError('Слишком много попыток. Подождите 15 минут.');
        } else {
          setServerError('Неверный email или пароль');
        }
      } else {
        setServerError('Ошибка подключения к серверу');
      }
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: '#1A1A2E' }}
    >
      <div className="w-full max-w-[400px] px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1
            className="text-4xl font-bold tracking-tight"
            style={{ color: '#C0392B' }}
          >
            DAR Rail
          </h1>
          <p className="mt-2 text-gray-400 text-sm">Система управления контентом</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Server error banner */}
            {serverError && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {serverError}
              </div>
            )}

            {/* Email */}
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                disabled={isSubmitting}
                {...register('email')}
                className={[
                  'w-full rounded-lg border px-3 py-2 text-sm outline-none transition',
                  'focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed',
                  errors.email
                    ? 'border-red-400 focus:ring-red-300'
                    : 'border-gray-300 focus:ring-red-300 focus:border-red-400',
                ].join(' ')}
                placeholder="admin@darrail.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="mb-6">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Пароль
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  {...register('password')}
                  className={[
                    'w-full rounded-lg border px-3 py-2 pr-10 text-sm outline-none transition',
                    'focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed',
                    errors.password
                      ? 'border-red-400 focus:ring-red-300'
                      : 'border-gray-300 focus:ring-red-300 focus:border-red-400',
                  ].join(' ')}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#C0392B' }}
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {isSubmitting ? 'Вход...' : 'Войти'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
