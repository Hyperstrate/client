import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Modal from './Modal.global.vue'

describe('Modal', () => {
  it('starts closed', () => {
    const wrapper = mount(Modal)
    expect((wrapper.vm as InstanceType<typeof Modal>).isOpen).toBe(false)
  })

  it('open() sets isOpen to true and emits open', () => {
    const wrapper = mount(Modal)
    ;(wrapper.vm as InstanceType<typeof Modal>).open()
    expect((wrapper.vm as InstanceType<typeof Modal>).isOpen).toBe(true)
    expect(wrapper.emitted('open')).toBeTruthy()
  })

  it('close() sets isOpen to false and emits close', () => {
    const wrapper = mount(Modal)
    const vm = wrapper.vm as InstanceType<typeof Modal>
    vm.open()
    vm.close()
    expect(vm.isOpen).toBe(false)
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('close() is a no-op when already closed', () => {
    const wrapper = mount(Modal)
    const vm = wrapper.vm as InstanceType<typeof Modal>
    vm.close()
    expect(wrapper.emitted('close')).toBeFalsy()
  })

  it('toggle() opens when closed', () => {
    const wrapper = mount(Modal)
    const vm = wrapper.vm as InstanceType<typeof Modal>
    vm.toggle()
    expect(vm.isOpen).toBe(true)
  })

  it('toggle() closes when open', () => {
    const wrapper = mount(Modal)
    const vm = wrapper.vm as InstanceType<typeof Modal>
    vm.open()
    vm.toggle()
    expect(vm.isOpen).toBe(false)
  })

  it('onUpdateOpen(false) closes the modal', () => {
    const wrapper = mount(Modal)
    const vm = wrapper.vm as InstanceType<typeof Modal>
    vm.open()
    vm.onUpdateOpen(false)
    expect(vm.isOpen).toBe(false)
  })

  it('onUpdateOpen(true) does not change state', () => {
    const wrapper = mount(Modal)
    const vm = wrapper.vm as InstanceType<typeof Modal>
    vm.onUpdateOpen(true)
    expect(vm.isOpen).toBe(false)
  })
})
