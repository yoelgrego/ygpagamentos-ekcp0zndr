import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { YgInput, YgLabel, YgFieldGroup } from '@/components/yg-ui'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/pocketbase/errors'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as any)?.from || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignup, setIsSignup] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return toast.error('Preencha email e senha')
    setLoading(true)
    const fn = isSignup ? signUp : signIn
    const { error } = await fn(email, password)
    setLoading(false)
    if (error) {
      toast.error(getErrorMessage(error))
      return
    }
    toast.success(isSignup ? 'Conta criada!' : 'Login realizado!')
    navigate(from, { replace: true })
  }

  return (
    <div className="flex items-center justify-center h-full">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full max-w-[300px]">
        <h2 className="text-lg font-bold text-yg-dark text-center">
          {isSignup ? 'Criar Conta' : 'Entrar'}
        </h2>
        <YgFieldGroup>
          <YgLabel>Email</YgLabel>
          <YgInput
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            style={{ width: '100%' }}
          />
        </YgFieldGroup>
        <YgFieldGroup>
          <YgLabel>Senha</YgLabel>
          <YgInput
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            style={{ width: '100%' }}
          />
        </YgFieldGroup>
        <button
          type="submit"
          disabled={loading}
          className="h-[28px] bg-yg-dark text-white font-bold text-[12px] hover:bg-blue-800 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Aguarde...' : isSignup ? 'Criar Conta' : 'Entrar'}
        </button>
        <button
          type="button"
          onClick={() => setIsSignup(!isSignup)}
          className="text-[11px] text-yg-dark hover:underline text-center"
        >
          {isSignup ? 'Já tem conta? Entrar' : 'Não tem conta? Criar'}
        </button>
        {!isSignup && (
          <p className="text-[10px] text-gray-400 text-center">
            Demo: yoelgrego@yoelgrego.blog / Skip@Pass
          </p>
        )}
        <Link to="/" className="text-[11px] text-gray-500 hover:underline text-center">
          ← Voltar
        </Link>
      </form>
    </div>
  )
}
