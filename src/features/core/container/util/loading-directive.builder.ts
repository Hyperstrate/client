import { configure } from '@/util/container'
import registerLoading from '@/util/loading'
import { APP } from '..'

export default configure(async (get) => void registerLoading(await get(APP)))
