import { useState, useEffect } from 'react'
import { getTransactions, createTransaction, deleteTransaction } from '../api'

export function useTransactions(month) {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const data = await getTransactions({ month })
    setTransactions(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [month])

  const add = async (data) => {
    await createTransaction(data)
    load()
  }

  const remove = async (id) => {
    await deleteTransaction(id)
    load()
  }

  return { transactions, loading, add, remove, reload: load }
}