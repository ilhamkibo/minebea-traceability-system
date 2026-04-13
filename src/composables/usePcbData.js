import { ref } from 'vue'
import staticData from '../data/pcbData.json'

// Make it a singleton to persist data across component mounts
const pcbRecords = ref(staticData)

export function usePcbData() {
  const findByQr = (qr) => {
    if (!qr) return null
    // Trim and case-insensitive search
    const cleanQr = qr.trim().toLowerCase()
    return pcbRecords.value.find(p => p.id.toLowerCase() === cleanQr)
  }

  const getDailyStats = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const last7Days = []
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      last7Days.push({
        date: d.toISOString().split('T')[0],
        dayName: days[d.getDay()],
        total: 0,
        ok: 0
      })
    }

    pcbRecords.value.forEach(pcb => {
      const pcbDate = pcb.lastUpdate.split('T')[0]
      const dayStat = last7Days.find(s => s.date === pcbDate)
      if (dayStat) {
        dayStat.total++
        if (pcb.currentStatus === 'OK') dayStat.ok++
      }
    })

    return {
      categories: last7Days.map(s => s.dayName),
      totalSeries: last7Days.map(s => s.total),
      okSeries: last7Days.map(s => s.ok)
    }
  }

  const getProcessDistribution = () => {
    const processes = ['Camera Check', 'Visual Check', 'Touch Up', 'ROM Writing']
    return processes.map(proc => {
      const count = pcbRecords.value.filter(p => p.history.some(h => h.step === proc)).length
      const percentage = pcbRecords.value.length > 0 ? Math.round((count / pcbRecords.value.length) * 100) : 0
      return { name: proc, percentage }
    })
  }

  return {
    pcbRecords,
    findByQr,
    getDailyStats,
    getProcessDistribution
  }
}
