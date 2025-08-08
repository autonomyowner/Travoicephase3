"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { transcribeVoice } from "../lib/api"

type VoiceRecorderProps = {
  onTranscribed: (text: string) => void
}

export default function VoiceRecorder({ onTranscribed }: VoiceRecorderProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [error, setError] = useState<string>("")
  const [status, setStatus] = useState<string>("Idle")

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
      mr.onstart = () => { setIsRecording(true); setIsPaused(false); setStatus("Recording…") }
      mr.onpause = () => { setIsPaused(true); setStatus("Paused") }
      mr.onresume = () => { setIsPaused(false); setStatus("Recording…") }
      mr.onstop = async () => {
        setIsRecording(false)
        setIsPaused(false)
        setStatus("Transcribing…")
        const blob = new Blob(chunksRef.current, { type: mime })
        try {
          const { text } = await transcribeVoice(blob)
          onTranscribed(text)
          setStatus("Transcribed")
        } catch (e: unknown) {
          setError(e instanceof Error ? e.message : "Transcription failed")
          setStatus("Idle")
        }
      }
      mediaRecorderRef.current = mr
      mr.start(250)
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
        <span className="ml-auto text-[11px] text-white/80" aria-live="polite">{status}</span>
      </div>
      {error ? <p role="alert" className="text-xs text-red-300">{error}</p> : null}
      <p className="text-[11px] text-white/80">Record your thought and we’ll transcribe it.</p>
    </div>
  )
}


