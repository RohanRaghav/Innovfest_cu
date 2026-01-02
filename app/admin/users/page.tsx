"use client"

import { useEffect, useState } from "react"

type User = {
  _id: string
  email: string
  fullName: string | null
  phone: string | null
  pinCode: string | null
  city: string | null
  state: string | null
  role: string
  points: number
  tasksDone: number
  createdAt: string
  updatedAt: string
}

export default function Page() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/users")
      .then(res => res.json())
      .then(data => {
        setUsers(data)
        setLoading(false)
      })
  }, [])

  const updateUserField = (
    userId: string,
    field: keyof User,
    value: any
  ) => {
    setUsers(prev =>
      prev.map(u =>
        u._id === userId ? { ...u, [field]: value } : u
      )
    )
  }

  const saveUser = async (user: User) => {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user._id,
        role: user.role,
        points: user.points,
        tasksDone: user.tasksDone,
      }),
    })
  }

  if (loading)
    return (
      <p className="p-10 text-[#002263] font-semibold">
        Loading users...
      </p>
    )

  return (
    <div className="p-10 bg-[#f8f2bf] min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-[#002263]">
        Admin Dashboard
      </h1>

      <div className="overflow-x-auto border-2 border-[#002263] rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-[#002263] text-[#f8f2bf]">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">City</th>
              <th className="p-3">State</th>
              <th className="p-3">Role</th>
              <th className="p-3">Points</th>
              <th className="p-3">Tasks</th>
              <th className="p-3">Created</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {users.map(user => (
              <tr
                key={user._id}
                className="border-t border-[#002263]"
              >
                <td className="p-3 text-[#002263]">
                  {user.fullName ?? "-"}
                </td>
                <td className="p-3 text-[#002263]">
                  {user.email}
                </td>
                <td className="p-3 text-[#002263]">
                  {user.phone ?? "-"}
                </td>
                <td className="p-3 text-[#002263]">
                  {user.city ?? "-"}
                </td>
                <td className="p-3 text-[#002263]">
                  {user.state ?? "-"}
                </td>

                {/* ROLE */}
                <td className="p-3">
                  <select
                    value={user.role}
                    onChange={e =>
                      updateUserField(user._id, "role", e.target.value)
                    }
                    className="bg-[#f8f2bf] border-2 border-[#002263] text-[#002263] p-1 rounded"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="CA">CA</option>
                    <option value="ZONE_HEAD">ZONE_HEAD</option>
                  </select>
                </td>

                {/* POINTS */}
                <td className="p-3">
                  <input
                    type="number"
                    value={user.points}
                    onChange={e =>
                      updateUserField(
                        user._id,
                        "points",
                        Number(e.target.value)
                      )
                    }
                    className="bg-[#f8f2bf] border-2 border-[#002263] text-[#002263] p-1 w-20 rounded"
                  />
                </td>

                {/* TASKS DONE */}
                <td className="p-3">
                  <input
                    type="number"
                    value={user.tasksDone}
                    onChange={e =>
                      updateUserField(
                        user._id,
                        "tasksDone",
                        Number(e.target.value)
                      )
                    }
                    className="bg-[#f8f2bf] border-2 border-[#002263] text-[#002263] p-1 w-20 rounded"
                  />
                </td>

                <td className="p-3 text-[#002263]">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>

                <td className="p-3">
                  <button
                    onClick={() => saveUser(user)}
                    className="bg-[#890304] text-[#f8f2bf] px-4 py-1 rounded hover:opacity-90"
                  >
                    Save
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
