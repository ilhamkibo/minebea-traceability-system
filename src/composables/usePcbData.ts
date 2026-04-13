import { ref } from 'vue'
import staticData from '../data/pcbData.json'

export interface HistoryLog {
  step: string;
  status: 'OK' | 'NG';
  time: string;
}

export interface PcbRecord {
  id: string;
  currentStatus: 'OK' | 'NG' | 'Disposal';
  currentStep: string;
  lastUpdate: string;
  history: HistoryLog[];
}

// Singleton to persist data across component mounts
const pcbRecords = ref<PcbRecord[]>(staticData as PcbRecord[])

export function usePcbData() {
  const findByQr = (qr: string | null): PcbRecord | undefined => {
    if (!qr) return undefined
    const cleanQr = qr.trim().toLowerCase()
    return pcbRecords.value.find(p => p.id.toLowerCase() === cleanQr)
  }

  const getDailyStats = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const last7Days: { date: string, dayName: string, total: number, ok: number }[] = []
    
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
