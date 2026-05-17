import registerClipboard from '@/util/clipboard'
import { configure } from '@/util/container'
import { APP } from '..'

export default configure(async (get) => void registerClipboard(await get(APP)))
