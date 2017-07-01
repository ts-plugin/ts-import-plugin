import React from 'react'
import { Alert, Affix as S, AutoComplete } from 'antd'
import { OtherComponent } from './other'
import { forEach } from 'lodash'

export class Test extends React.PureComponent<void, void> {
  render() {
    return (
      <OtherComponent>
        <Alert message='hello world'/>
      </OtherComponent>
    )
  }
}