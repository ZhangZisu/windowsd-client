import express from 'express'
import { createProxyServer } from 'http-proxy'
import { extensions } from 'webdav-server/lib/index.v2'
import { json } from 'body-parser'

import { packageJson } from '@/shared/package'
import { cliArgs } from '@/shared/cli'
import { endpoints } from '@/interface/cm'
import { DAVServer } from '@/interface/dav'
import { invoke } from '@/router'

const proxy = createProxyServer()

export const app = express()

app.use(json())

app.get('/', (_req, res) => {
  res.json(packageJson)
})

app.get(`/${cliArgs.device}`, (_req, res) => {
  res.json(true)
})

app.use(extensions.express(`/${cliArgs.device}/dav`, DAVServer))

app.post(`/${cliArgs.device}/rpc`, (req, res) => {
  const { method, args, cfg } = req.body
  if (typeof method !== 'string') return <unknown>res.status(400).send('method')
  if (typeof args !== 'object') return <unknown>res.status(400).send('args')
  if (typeof cfg !== 'object') return <unknown>res.status(400).send('cfg')
  invoke(method, args, cfg)
    .then((result) => res.json(result))
    .catch((err) => res.status(500).json(err))
})

app.post(`/${cliArgs.device}/sh`, (_req, res) => {
  res.status(501).send('Not Implemented')
})

app.post(`/${cliArgs.device}/proxy`, (_req, res) => {
  res.status(501).send('Not Implemented')
})

app.use('/:id/:method', (req, res) => {
  if (!endpoints.has(req.params.id)) return <unknown>res.status(400).send('Bad request')
  const ep = endpoints.get(req.params.id)!
  proxy.web(req, res, {
    target: `http://${ep}/${req.params.id}/${req.params.method}`
  })
})
