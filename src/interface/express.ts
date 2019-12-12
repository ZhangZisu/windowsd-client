import express from 'express'
import { createProxyServer } from 'http-proxy'
import { extensions } from 'webdav-server/lib/index.v2'

import { packageJson } from '@/shared/package'
import { cliArgs } from '@/cli'
import { endpoints } from '@/interface/cm'
import { DAVServer } from '@/interface/dav'

const proxy = createProxyServer()

export const app = express()

app.get('/', (_req, res) => {
  res.json(packageJson)
})

app.get(`/${cliArgs.device}`, (_req, res) => {
  res.json(true)
})

app.use(extensions.express(`/${cliArgs.device}/dav`, DAVServer))

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
