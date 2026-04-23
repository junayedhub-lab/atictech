import { useEffect, useState } from 'react'
import { Shield, ShieldOff, Search } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types'
import { Helmet } from 'react-helmet-async'
import { Skeleton } from '@/components/ui/Skeleton'
import Badge from '@/components/ui/Badge'
import toast from 'react-hot-toast'

export default function AdminUsers() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase.from('profiles').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setUsers(data || [])
      setLoading(false)
    })
  }, [])

  async function toggleBlock(user: Profile) {
    const newVal = !user.is_blocked
    await supabase.from('profiles').update({ is_blocked: newVal }).eq('id', user.id)
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_blocked: newVal } : u))
    toast.success(newVal ? 'User blocked' : 'User unblocked')
  }

  const filtered = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search)
  )

  return (
    <>
      <Helmet><title>Users — Admin</title></Helmet>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Users</h1>
          <p className="text-slate-400 text-sm mt-1">{users.length} registered users</p>
        </div>

        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or phone…"
            className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50">
                  {['User', 'Phone', 'Role', 'Joined', 'Status', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-4 py-3"><Skeleton className="h-10 rounded" /></td></tr>
                )) : filtered.map(user => (
                  <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                          {user.full_name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-slate-200">{user.full_name || 'Unknown'}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[180px]">{user.address || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{user.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={user.role === 'admin' ? 'purple' : 'default'}>{user.role}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={user.is_blocked ? 'danger' : 'success'}>
                        {user.is_blocked ? 'Blocked' : 'Active'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => toggleBlock(user)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            user.is_blocked
                              ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                              : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                          }`}
                        >
                          {user.is_blocked ? <><Shield size={12} /> Unblock</> : <><ShieldOff size={12} /> Block</>}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && filtered.length === 0 && <div className="py-12 text-center text-slate-500">No users found</div>}
          </div>
        </div>
      </div>
    </>
  )
}
