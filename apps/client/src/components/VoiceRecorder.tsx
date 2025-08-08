"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { createVoiceSession, finishVoiceSession, sendVoiceChunk, streamVoiceSession, transcribeVoice } from "../lib/api"

type VoiceRecorderProps = {
  onTranscribed: (text: string) => void
  mode?: 'single' | 'live'
  onDelta?: (delta: { nodes?: any[]; edges?: any[] }) => void
}

export default function VoiceRecorder({ onTranscribed, mode = 'single', onDelta }: VoiceRecorderProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [error, setError] = useState<string>("")
  const [status, setStatus] = useState<string>("Idle")
  const sessionIdRef = useRef<string | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    return () => {
      try { mediaRecorderRef.current?.stop() } catch {}
      mediaStreamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  const handleStart = useCallback(async () => {
    setError("")
    setStatus("Requesting microphone…")
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("This browser does not support audio recording.")
        return
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/ogg"
      const mr = new MediaRecorder(stream, { mimeType: mime })
      chunksRef.current = []
      mr.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstart = async () => {
        setIsRecording(true); setIsPaused(false); setStatus("Recording…")
        if (mode === 'live') {
          // create session and open SSE
          const { sessionId } = await createVoiceSession()
          sessionIdRef.current = sessionId
          eventSourceRef.current = streamVoiceSession(sessionId, (evt) => {
            if (evt.type === 'transcript') {
              const text = (evt.data?.chunks?.map((c: any) => c.text) || []).join(' ')
              if (text) onTranscribed(text)
            }
            if (evt.type === 'delta') {
              onDelta?.(evt.data?.delta || {})
            }
          })
        }
      }
      mr.onpause = () => { setIsPaused(true); setStatus("Paused") }
      mr.onresume = () => { setIsPaused(false); setStatus("Recording…") }
      mr.onstop = async () => {
        setIsRecording(false)
        setIsPaused(false)
        const blob = new Blob(chunksRef.current, { type: mime })
        if (mode === 'single') {
          setStatus("Transcribing…")
          try {
            const { text } = await transcribeVoice(blob)
            onTranscribed(text)
            setStatus("Transcribed")
          } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Transcription failed")
            setStatus("Idle")
          }
        } else {
          // send final chunk and finish session
          try {
            const sid = sessionIdRef.current
            if (sid) {
              await sendVoiceChunk(sid, blob)
              await finishVoiceSession(sid)
            }
          } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to finalize session")
          } finally {
            eventSourceRef.current?.close()
            sessionIdRef.current = null
            eventSourceRef.current = null
            setStatus("Finished")
          }
        }
      }
      mediaRecorderRef.current = mr
      // request dataavailable at intervals; for live mode also upload periodically
      mr.start(2000)
      if (mode === 'live') {
        const interval = setInterval(async () => {
          if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') return
          // pull current chunks and reset buffer
          const parts = chunksRef.current.splice(0, chunksRef.current.length)
          if (parts.length === 0) return
          const chunkBlob = new Blob(parts, { type: mime })
          const sid = sessionIdRef.current
          if (sid) {
            try { await sendVoiceChunk(sid, chunkBlob) } catch {}
          }
        }, 2500)
        ;(mr as any)._ncInterval = interval
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to access microphone")
      setStatus("Idle")
    }
  }, [onTranscribed])

  const handlePause = useCallback(() => {
    const mr = mediaRecorderRef.current
    if (!mr || mr.state !== "recording") return
    mr.pause()
  }, [])

  const handleResume = useCallback(() => {
    const mr = mediaRecorderRef.current
    if (!mr || mr.state !== "paused") return
    mr.resume()
  }, [])

  const handleStop = useCallback(() => {
    const mr = mediaRecorderRef.current
    if (!mr) return
    try { mr.stop() } catch {}
    if ((mr as any)._ncInterval) {
      clearInterval((mr as any)._ncInterval)
      ;(mr as any)._ncInterval = undefined
    }
    mediaStreamRef.current?.getTracks().forEach((t) => t.stop())
    mediaStreamRef.current = null
  }, [])

  return (
    <div className="rounded-md border border-white/20 bg-black/30 p-2 space-y-1 shadow-lg">
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleStart}
          disabled={isRecording}
          className="rounded-md border border-white/25 px-2.5 py-1 text-xs hover:bg-white/10 disabled:opacity-50"
        >Start</button>
        <button
          onClick={handlePause}
          disabled={!isRecording || isPaused}
          className="rounded-md border border-white/25 px-2.5 py-1 text-xs hover:bg-white/10 disabled:opacity-50"
        >Pause</button>
        <button
          onClick={handleResume}
          disabled={!isRecording || !isPaused}
          className="rounded-md border border-white/25 px-2.5 py-1 text-xs hover:bg-white/10 disabled:opacity-50"
        >Resume</button>
        <button
          onClick={handleStop}
          disabled={!isRecording}
          className="rounded-md border border-white/25 px-2.5 py-1 text-xs hover:bg-white/10 disabled:opacity-50"
        >Stop & Transcribe</button>
        <span className="ml-auto text-[11px] text-white/80" aria-live="polite">{mode === 'live' ? 'Live' : 'Single'} · {status}</span>
      </div>
      {error ? <p role="alert" className="text-xs text-red-300">{error}</p> : null}
      <p className="text-[11px] text-white/80">Record your thought and we’ll transcribe it.</p>
    </div>
  )
}


