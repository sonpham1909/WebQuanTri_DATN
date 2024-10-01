import { Spin } from 'antd'
import React from 'react'

export default function LoadingCo() {
  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%'}}>
    <h3 style={{margin:10}}>Loading</h3>
    <Spin/>
</div>

  )
}
